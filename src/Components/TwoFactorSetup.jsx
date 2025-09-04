import React, { useState } from 'react';
import { auth } from '../../firebase';
import { PhoneAuthProvider, multiFactor, RecaptchaVerifier } from 'firebase/auth';
import { Form, Button, Alert, Spinner, Container, Row, Col } from 'react-bootstrap';

function TwoFactorSetup() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('input');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verificationId, setVerificationId] = useState(null);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', { size: 'invisible' }, auth);
      const session = await multiFactor(auth.currentUser).getSession();
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber({ phoneNumber: phone, session }, window.recaptchaVerifier);
      setVerificationId(verificationId);
      setStep('verify');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const cred = PhoneAuthProvider.credential(verificationId, code);
      await multiFactor(auth.currentUser).enroll(cred, 'Phone');
      setStep('done');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={6}>
          <h4>Configurer la double authentification (2FA)</h4>
          {error && <Alert variant="danger">{error}</Alert>}
          {step === 'input' && (
            <Form onSubmit={handleSendCode}>
              <Form.Group className="mb-3">
                <Form.Label>Numéro de téléphone</Form.Label>
                <Form.Control type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+33..." required />
              </Form.Group>
              <div id="recaptcha-container"></div>
              <Button type="submit" disabled={loading}>{loading ? 'Envoi...' : 'Envoyer le code'}</Button>
            </Form>
          )}
          {step === 'verify' && (
            <Form onSubmit={handleVerifyCode}>
              <Form.Group className="mb-3">
                <Form.Label>Code reçu par SMS</Form.Label>
                <Form.Control type="text" value={code} onChange={e => setCode(e.target.value)} required />
              </Form.Group>
              <Button type="submit" disabled={loading}>{loading ? 'Vérification...' : 'Vérifier'}</Button>
            </Form>
          )}
          {step === 'done' && <Alert variant="success">2FA activée avec succès !</Alert>}
        </Col>
      </Row>
    </Container>
  );
}

export default TwoFactorSetup;
