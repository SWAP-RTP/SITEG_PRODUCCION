
export const UseFetchPatch = async(url, obj, token="") => {

  try{
    const res = await fetch(url, {
      method: 'PATCH',
      body: JSON.stringify(obj),
      withCredentials: true,
      credentials: 'same-origin',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    if(!res)
      throw new Error("WARN", res.status);
    const data = await res.json();
    return data;
  }
  catch(err){
    throw err
  }
}
