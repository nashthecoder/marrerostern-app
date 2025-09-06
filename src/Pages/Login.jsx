import React, { useState } from "react";
import { Form, Button, ButtonGroup, Container, Row, Col } from "react-bootstrap";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword, PhoneAuthProvider, multiFactor } from "firebase/auth";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import "../assets/css/Login.css";
import { useNavigate } from "react-router-dom"; // ✅ ajout
import TwoFactorSetup from '../Components/TwoFactorSetup';

function Login({ setIsAuthenticated }) { // ✅ reçoit la prop
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaError, setMfaError] = useState(null);
  const [mfaResolver, setMfaResolver] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const navigate = useNavigate(); // ✅ pour la redirection
  // Use English keys for logic, French labels for display
  const roles = [
    { key: "provider", label: "Prestataire" },
    { key: "owner", label: "Propriétaire" },
    { key: "admin", label: "Administrateur" },
    { key: "traveler", label: "Voyageur" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      // --- Device/session tracking ---
      try {
        let ip = '';
        try {
          const res = await fetch('https://api.ipify.org?format=json');
          const data = await res.json();
          ip = data.ip;
        } catch (e) {}
        await addDoc(collection(db, `users/${user.uid}/devices`), {
          userAgent: navigator.userAgent,
          ip,
          timestamp: serverTimestamp(),
        });
      } catch (e) {}

      let normalizedSelectedRole = selectedRole?.toLowerCase().trim();
      if (userSnap.exists()) {
        const userData = userSnap.data();
        let userRole = userData.role?.toLowerCase().trim() || "voyageur";
        if (normalizedSelectedRole === "administrateur") normalizedSelectedRole = "admin";
        console.log('Selected Role:', normalizedSelectedRole);
        console.log('User Role from Firestore:', userRole);
        if (normalizedSelectedRole !== userRole) {
          setError(`Access Denied: You selected the role "${normalizedSelectedRole}", but your actual role is "${userRole}".`);
          setLoading(false);
          return;
        }
        // --- 2FA check for non-admins ---
        if (userRole !== 'admin' && user.multiFactor && user.multiFactor.enrolledFactors.length > 0) {
          setMfaRequired(true);
          setLoading(false);
          return;
        }
        setIsAuthenticated(true);
        navigate("/dashboard");
      } else {
        setError("Aucun rôle défini pour cet utilisateur.");
      }
    } catch (err) {
      // Handle MFA required error
      if (err.code === 'auth/multi-factor-auth-required') {
        setMfaRequired(true);
        setMfaResolver(err.resolver);
      } else {
        setError(err.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <Container className="mt-3">
        <div className="login-header d-flex justify-content-between align-items-start px-4 py-3">
          <img src="/images/logo.png" alt="Logo" className="login-logo" />
          <div className="login-text-right text-white text-center">
            <h5 className="mb-1">L’application de conciergerie tout-en-un en France</h5>
            <em>pour une gestion simplifiée des locations saisonnières</em>
          </div>
        </div>
        <Row className="login-row mt-3">
          <Col xs={12} md={6}>
            <div className="login-form-section bg-light text-dark p-4 h-100 d-flex flex-column justify-content-center">
              <h4 className="text-dark mt-4 mb-4 text-center">Connexion à votre espace</h4>
              <ButtonGroup className="mb-4 d-flex gap-2 flex-wrap">
                {roles.map((r) => (
                  <Button
                    key={r.key}
                    variant="outline-dark"
                    className={`flex-grow-1 ${selectedRole === r.key ? "btn-cust-bg text-white" : ""}`}
                    onClick={() => setSelectedRole(r.key)}
                  >
                    {r.label}
                  </Button>
                ))}
              </ButtonGroup>
              {/* 2FA prompt for non-admins */}
              {mfaRequired ? (
                <div className="mt-3">
                  <TwoFactorSetup />
                  {mfaError && <div className="text-danger mb-2">{mfaError}</div>}
                </div>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Mot de passe</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>
                  {error && <div className="text-danger mb-2">{error}</div>}
                  <Button type="submit" className="w-100" disabled={loading}>
                    {loading ? "Connexion..." : "Se connecter"}
                  </Button>
                </Form>
              )}
            </div>
          </Col>
          <Col xs={12} md={6} className="d-none d-md-block">
            <div className="login-image-section h-100 d-flex align-items-center justify-content-center">
              <img src="/images/img-login.png" alt="Login" className="img-fluid" />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;