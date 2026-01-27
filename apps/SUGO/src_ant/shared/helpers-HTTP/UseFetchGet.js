
export const UseFetchGet = async(url, token="") => {

  try{
        const res = await fetch(url, {
          method: 'GET',
          withCredentials: true,
          credentials: 'same-origin',
          headers: {
            'Authorization': `Bearer ${token}`,
        }
        })
        const data = res.json();
        return data;
    }
  catch(err){
      throw new Error(`Fallo en la peticion de UseFetchGet`, err)
    }
}
