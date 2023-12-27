import { collection, onSnapshot, query } from "firebase/firestore";
import { Suspense, useEffect, useState } from "react";
import { Table, Col, Container, Row } from "react-bootstrap";
import { db } from "../firebase/config";

const ListingsTable = () => {
  const [listings, setListings] = useState(null);
  useEffect(() => {
    const q = query(collection(db, "listings"));
    const unsub = onSnapshot(q, (querySnapshot) => {
      const listingArr = [];
      querySnapshot.forEach((doc) => {
        listingArr.push(doc.data());
      });
      setListings(listingArr);
    });
    return () => unsub();
  }, []);

  return (
    <Container>
      <Row>
        <Col>
          <a href="/add-listing" className="btn btn-primary">
            Add Listing
          </a>
        </Col>
      </Row>
      <Row>
        <Table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Property</th>
              <th>Owner</th>
              <th>Door Lock Device Id</th>
            </tr>
          </thead>
          <tbody>
            <Suspense fallback={<option>Loading...</option>}>
              {listings?.map((listing) => (
                <tr key={listing.hostawayId}>
                  <td>{listing.hostawayId}</td>
                  <td>{listing.propertyName}</td>
                  <td>{listing.ownerName}</td>
                  <td>{listing.deviceId}</td>
                </tr>
              ))}
            </Suspense>
          </tbody>
        </Table>
      </Row>
    </Container>
  );
};

export default ListingsTable;
