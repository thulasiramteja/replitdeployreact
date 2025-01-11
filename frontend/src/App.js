import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserForm from './components/UserForm';

const App = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      // Update with your backend URL
      const { data } = await axios.get('https://replitdeploybackend-production.up.railway.app/users/view');
      setUsers(data);
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <UserForm />
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
