import { Suspense, useEffect, useState } from "react";
import { Col, Container, Row, Table } from "react-bootstrap";
import { db } from "../firebase/config";
import { collection, onSnapshot, query } from "firebase/firestore";
import { DateTime } from "luxon";

const GuestTable = () => {
  const [reservations, setReservations] = useState(null);
  //   const [property, setProperty] = useState(null);

  //   const getListingPropertyName = async (id) => {
  //     const docSnap = await getDoc(doc(db, "listings", parseFloat(id)));
  //     if (docSnap.exists()) {
  //       console.log(docSnap.data().propertyName);
  //       return docSnap.data().propertyName;
  //     } else {
  //       console.log("no such document");
  //     }
  //   };
  useEffect(() => {
    let resArray = [];
    const q = query(collection(db, "bookings"));
    const unsub = onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        resArray.push(doc.data());
      });
      setReservations(resArray);
    });
    return () => unsub();
  }, []);

  //   const getListingPropertyName = async (id) => {
  //     const docSnap = await getDoc(doc(db, "listings", parseFloat(id)));
  //     if (docSnap.exists()) {
  //       console.log(docSnap.data().propertyName);
  //       return docSnap.data().propertyName;
  //     } else {
  //       console.log("no such document");
  //     }
  //   };
  return (
    <Container className="py-5">
      <Row>
        <Col>
          <Table>
            <thead>
              <tr>
                <th>Guest Name</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Door Code</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <Suspense fallback={<option>Loading...</option>}>
                {reservations?.map((reservation) => (
                  <tr key={reservation.id}>
                    <td>{reservation.guestName}</td>
                    {/* <td>
                      {() => getListingPropertyName(reservation.listingMapId)}
                    </td> */}
                    <td>
                      {DateTime.fromISO(reservation.arrivalDate).toLocaleString(
                        DateTime.DATE_SHORT
                      )}
                    </td>
                    <td>
                      {DateTime.fromISO(
                        reservation.departureDate
                      ).toLocaleString(DateTime.DATE_SHORT)}
                    </td>
                    <td>{reservation.doorCode}</td>
                    <td>{reservation.status}</td>
                  </tr>
                ))}
              </Suspense>
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default GuestTable;
