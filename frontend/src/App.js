import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserForm from './components/UserForm';

const App = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await axios.get('https://replitdeployreact-production.up.railway.app/users/view');
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

// Make sure you're exporting it correctly
export default App;
