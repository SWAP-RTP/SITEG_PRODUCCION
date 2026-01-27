// export const UseFetchPost = async(url= '', obj= {}, token="") => {
//     try{
//       const res = await fetch(url, {
//         method: 'POST',
//         body: JSON.stringify(obj),
//         withCredentials: true,
//         credentials: 'same-origin',
//         headers:{
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         }
//       })
//       if(!res) throw new Error("WARN", res.status);
//       const data = await res.json();
//       return data;
//     }
//     catch(err){
//       throw new Error(err)
//     }
// }

/**
 * @param {string} url API
 * @param {Object} obj body 
 * @returns data
 */
export const UseFetchPost = async(url= '', obj= {}) => {
    try{
      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: new Headers ({
          'Content-Type': 'application/json'
        })
      })
      const data = await res.json();
      if( res.status >= 400 || data.error) {
        throw (data)
        const errorMsg = data.error || data.message || 'Error en el UseFetchPost'   
        throw new Error(`${errorMsg}`)
      }

      return data;
    }
    catch(err){
      throw err
    }
}