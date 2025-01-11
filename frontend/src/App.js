const App = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      // Replace with the Railway URL and make sure the port is correct
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
