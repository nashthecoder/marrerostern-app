import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../../firebase';
import { 
  collection, addDoc, getDocs, query, where, orderBy, onSnapshot,
  doc, updateDoc, arrayUnion
} from 'firebase/firestore';
import { Card, Row, Col, Form, Button, Badge, ListGroup, Alert } from 'react-bootstrap';

function EnhancedMessaging() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        fetchUsers();
        fetchConversations(user);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      const unsubscribe = onSnapshot(
        query(
          collection(db, 'messages'),
          where('conversationId', '==', selectedConversation.id),
          orderBy('timestamp', 'asc')
        ),
        (snapshot) => {
          const messagesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setMessages(messagesData);
          scrollToBottom();
        }
      );
      return () => unsubscribe();
    }
  }, [selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    } catch (e) {
      setError(e.message);
    }
  };

  const fetchConversations = async (user) => {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', user.uid)
      );
      const snapshot = await getDocs(q);
      const conversationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConversations(conversationsData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (participantId) => {
    try {
      if (!currentUser) return;

      // Check if conversation already exists
      const existingConv = conversations.find(conv => 
        conv.participants.includes(participantId) && 
        conv.participants.includes(currentUser.uid) &&
        conv.participants.length === 2
      );

      if (existingConv) {
        setSelectedConversation(existingConv);
        return;
      }

      // Create new conversation
      const conversationData = {
        participants: [currentUser.uid, participantId],
        createdAt: new Date(),
        lastMessage: '',
        lastMessageTimestamp: new Date(),
        unreadCounts: {
          [currentUser.uid]: 0,
          [participantId]: 0
        }
      };

      const docRef = await addDoc(collection(db, 'conversations'), conversationData);
      const newConversation = { id: docRef.id, ...conversationData };
      
      setConversations(prev => [...prev, newConversation]);
      setSelectedConversation(newConversation);
    } catch (e) {
      setError(e.message);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    try {
      const messageData = {
        conversationId: selectedConversation.id,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email,
        content: newMessage.trim(),
        timestamp: new Date(),
        read: false
      };

      await addDoc(collection(db, 'messages'), messageData);

      // Update conversation with last message
      await updateDoc(doc(db, 'conversations', selectedConversation.id), {
        lastMessage: newMessage.trim(),
        lastMessageTimestamp: new Date(),
        [`unreadCounts.${getOtherParticipant(selectedConversation).id}`]: 
          selectedConversation.unreadCounts?.[getOtherParticipant(selectedConversation).id] + 1 || 1
      });

      setNewMessage('');
    } catch (e) {
      setError(e.message);
    }
  };

  const getOtherParticipant = (conversation) => {
    const otherParticipantId = conversation.participants.find(id => id !== currentUser?.uid);
    return users.find(user => user.id === otherParticipantId) || { id: otherParticipantId, email: 'Utilisateur inconnu' };
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'administrator': return 'primary';
      case 'owner': return 'success';
      case 'provider': return 'warning';
      case 'traveler': case 'voyageur': return 'info';
      default: return 'secondary';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div style={{ height: '600px' }}>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row className="h-100">
        {/* Conversations List */}
        <Col md={4} className="border-end">
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Messages</h6>
              <Badge bg="primary">{conversations.length}</Badge>
            </Card.Header>
            <Card.Body className="p-0 overflow-auto">
              {/* New Conversation */}
              <div className="p-3 border-bottom">
                <h6 className="mb-2">Nouveau message</h6>
                <Form.Select
                  size="sm"
                  onChange={(e) => e.target.value && createConversation(e.target.value)}
                  value=""
                >
                  <option value="">Sélectionner un utilisateur...</option>
                  {users
                    .filter(user => user.id !== currentUser?.uid)
                    .map(user => (
                      <option key={user.id} value={user.id}>
                        {user.nom || user.email} ({user.role})
                      </option>
                    ))
                  }
                </Form.Select>
              </div>

              {/* Conversations */}
              <ListGroup variant="flush">
                {conversations.map(conversation => {
                  const otherParticipant = getOtherParticipant(conversation);
                  const unreadCount = conversation.unreadCounts?.[currentUser?.uid] || 0;
                  
                  return (
                    <ListGroup.Item
                      key={conversation.id}
                      action
                      active={selectedConversation?.id === conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className="px-3 py-3"
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-1">
                          <div className="d-flex align-items-center mb-1">
                            <strong className="me-2">{otherParticipant.nom || otherParticipant.email}</strong>
                            <Badge bg={getRoleColor(otherParticipant.role)} size="sm">
                              {otherParticipant.role}
                            </Badge>
                          </div>
                          <small className="text-muted d-block text-truncate" style={{maxWidth: '200px'}}>
                            {conversation.lastMessage || 'Aucun message'}
                          </small>
                          <small className="text-muted">
                            {formatTime(conversation.lastMessageTimestamp)}
                          </small>
                        </div>
                        {unreadCount > 0 && (
                          <Badge bg="danger" pill>{unreadCount}</Badge>
                        )}
                      </div>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* Chat Area */}
        <Col md={8}>
          {selectedConversation ? (
            <Card className="h-100 d-flex flex-column">
              <Card.Header>
                <div className="d-flex align-items-center">
                  <h6 className="mb-0 me-2">
                    {getOtherParticipant(selectedConversation).nom || getOtherParticipant(selectedConversation).email}
                  </h6>
                  <Badge bg={getRoleColor(getOtherParticipant(selectedConversation).role)}>
                    {getOtherParticipant(selectedConversation).role}
                  </Badge>
                </div>
              </Card.Header>

              {/* Messages */}
              <Card.Body className="flex-1 overflow-auto p-3" style={{ maxHeight: '400px' }}>
                <div className="d-flex flex-column gap-3">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`d-flex ${message.senderId === currentUser?.uid ? 'justify-content-end' : 'justify-content-start'}`}
                    >
                      <div
                        className={`p-2 rounded max-w-75 ${
                          message.senderId === currentUser?.uid
                            ? 'bg-primary text-white'
                            : 'bg-light text-dark'
                        }`}
                        style={{ maxWidth: '75%' }}
                      >
                        <div>{message.content}</div>
                        <small className={`d-block mt-1 ${
                          message.senderId === currentUser?.uid ? 'text-light' : 'text-muted'
                        }`}>
                          {formatTime(message.timestamp)}
                        </small>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </Card.Body>

              {/* Message Input */}
              <Card.Footer>
                <Form onSubmit={sendMessage}>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="text"
                      placeholder="Tapez votre message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!newMessage.trim()}>
                      Envoyer
                    </Button>
                  </div>
                </Form>
              </Card.Footer>
            </Card>
          ) : (
            <Card className="h-100 d-flex align-items-center justify-content-center">
              <Card.Body className="text-center">
                <h5 className="text-muted">Sélectionnez une conversation</h5>
                <p className="text-muted">Choisissez une conversation dans la liste ou créez-en une nouvelle</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}

export default EnhancedMessaging;