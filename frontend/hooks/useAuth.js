import { useEffect, useState } from 'react';

const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('user');
    if (data) {
      setUser(JSON.parse(data));
      console.log(JSON.parse(data));
    }
  }, []);

  return { user };
};

export default useAuth;
