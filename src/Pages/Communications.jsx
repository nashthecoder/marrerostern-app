import React from 'react';
import InboxMessages from '../Components/InboxMessages';
import Messaging from '../Components/Messaging';
import { Tabs, Tab } from 'react-bootstrap';
import Header from '../Components/Header';

function Communications({ setIsAuthenticated, isAuthenticated }) {
  return (
    <div className="container mt-4">
      <Header title="Communications & Avis" setIsAuthenticated={setIsAuthenticated} isAuthenticated={isAuthenticated} />
      <Tabs defaultActiveKey="inbox" id="communications-tabs" className="mb-4" justify>
        <Tab eventKey="inbox" title="Boîte de réception">
          <div className="mt-4"><InboxMessages /></div>
        </Tab>
        <Tab eventKey="create" title="Créer">
          <div className="mt-4"><Messaging role="admin" /></div>
        </Tab>
      </Tabs>
    </div>
  );
}

export default Communications;
