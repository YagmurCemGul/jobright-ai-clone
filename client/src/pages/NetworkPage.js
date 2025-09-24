import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const NetworkPage = () => {
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNetworkData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };

      const connectionsRes = await axios.get('/api/connections', config);
      const pendingRes = await axios.get('/api/connections/pending', config);

      setConnections(connectionsRes.data);
      setPendingRequests(pendingRes.data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNetworkData();
  }, [fetchNetworkData]);

  const handleAccept = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };
      await axios.post(`/api/connections/accept/${id}`, null, config);
      fetchNetworkData(); // Refetch data to ensure UI consistency
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };
      await axios.post(`/api/connections/reject/${id}`, null, config);
      fetchNetworkData(); // Refetch data to ensure UI consistency
    } catch (err) {
      console.error(err.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>My Network</h2>

      <section>
        <h3>Pending Requests ({pendingRequests.length})</h3>
        {pendingRequests.length > 0 ? (
          <ul>
            {pendingRequests.map((request) => (
              <li key={request._id}>
                {request.name} ({request.email})
                <button onClick={() => handleAccept(request._id)}>Accept</button>
                <button onClick={() => handleReject(request._id)}>Reject</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No pending requests.</p>
        )}
      </section>

      <section>
        <h3>Your Connections ({connections.length})</h3>
        {connections.length > 0 ? (
          <ul>
            {connections.map((connection) => (
              <li key={connection._id}>
                {connection.name} ({connection.email})
              </li>
            ))}
          </ul>
        ) : (
          <p>You have no connections yet.</p>
        )}
      </section>
    </div>
  );
};

export default NetworkPage;