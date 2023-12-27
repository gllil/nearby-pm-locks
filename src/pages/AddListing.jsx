import { useState } from "react";
import { Col, Container, Form, Row, Button, Spinner, Alert } from "react-bootstrap";
import { db } from "../firebase/config";
import { addDoc, doc, setDoc } from "firebase/firestore";

const AddListing = () => {
  const [listing, setListing] = useState({
    propertyName: "",
    hostawayId: "",
    ownerName: "",
    deviceId: "",
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [alertColor, setAlertColor] = useState('success')

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setListing({ ...listing, [name]: value });
  };
  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true);
    setDoc(doc(db, "listings", listing.hostawayId), listing).then((response) => {
        console.log(response)
        setAlert("Successfully added the listing")
      setAlertColor("success")
      setLoading(false);
      setListing({
        propertyName: "",
        hostawayId: "",
        ownerName: "",
        deviceId: "",
      });
      
      setTimeout(()=>{
          setAlert(null)
      },5000)
    }).catch(err => {
        console.log(err)
        setAlert(err.message)
        setAlertColor("danger")
        setTimeout(()=>{
            setAlert(null)
        },5000)
    })
  };
  return (
    <Container>
        <Row>
            <Col>
            {alert && <Alert variant={alertColor}>{alert}</Alert>}
            </Col>
        </Row>
      <Row>
        <Col>
          <Form onSubmit={handleSubmit} >
            <Form.Group className="mt-3">
              <Form.Label>Property Name</Form.Label>
              <Form.Control
                value={listing.propertyName}
                onChange={handleFormChange}
                name="propertyName"
                type="text"
                required
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Property Id</Form.Label>
              <Form.Control
                value={listing.hostawayId}
                onChange={handleFormChange}
                name="hostawayId"
                type="text"
                required
              />
              <Form.Text>It's the Hostaway Property ID</Form.Text>
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Owner Name</Form.Label>
              <Form.Control
                value={listing.ownerName}
                onChange={handleFormChange}
                name="ownerName"
                type="text"
                required
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Door Lock Device Id</Form.Label>
              <Form.Control
                value={listing.deviceId}
                onChange={handleFormChange}
                name="deviceId"
                type="text"
                required
              />
            </Form.Group>
            {loading ? (
              <Button className="mt-3" variant="primary" disabled>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                Loading...
              </Button>
            ) : (
              <Button type="submit" className="mt-3">Add Listing</Button>
            )}
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default AddListing;
