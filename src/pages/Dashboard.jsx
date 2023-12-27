
import { Container, Row, Tab, Tabs, Col } from "react-bootstrap";
import GuestTable from "../components/GuestTable";
import ListingsTable from "../components/ListingsTable";

const Dashboard = () => {

  return (
    <Container>
        <Row>
            <Col>
            <Tabs
      defaultActiveKey="guest"
      id="uncontrolled-tab-example"
      className="mb-3"
    >
      <Tab eventKey="guest" title="Guest">
      <GuestTable />
      </Tab>
      <Tab eventKey="listing" title="Listings">
        <ListingsTable />
      </Tab>
      
    </Tabs>
            </Col>
        </Row>
    </Container>
    
   
  );
};

export default Dashboard;
