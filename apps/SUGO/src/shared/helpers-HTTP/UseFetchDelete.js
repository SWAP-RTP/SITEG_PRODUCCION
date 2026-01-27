// interface Err {
//   status, 
//   msg, 
//   desc 
// }

export const UseFetchDelete = async(url) => {

  try{
    const res = await fetch(url, { 
      method: 'DELETE',
        credentials: 'same-origin',
        headers:{
          'Content-Type': 'application/json',
        }
   })
    const data = await res.json();
    // throw new Error(JSON.stringify(data));
    if(res.status >= 300)  throw { status: res.status, msg: data.msg || data.error || data.message || undefined, desc: data }
    return data;
  }
  catch(err){
    throw err
  }
}

// export const UseFetchDelete = async(url, token="") => {

//   try{
//     const res = await fetch(url, { 
//       method: 'DELETE',
//       withCredentials: true,
//         credentials: 'same-origin',
//         headers:{
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         }
//    })
//     if(!res)
//       throw new Error("WARN", res.status);
//     const data = await res.json();
//     return data;
//   }
//   catch(err){
//     throw err
//   }
// }
