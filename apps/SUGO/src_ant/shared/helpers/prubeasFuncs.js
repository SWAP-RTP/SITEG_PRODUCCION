
const dividirArrayEnGrupos = (array, maximoPorGrupo) => {
    const grupos = [];
    for (let i = 0; i < array.length; i += maximoPorGrupo) {
      grupos.push(array.slice(i, i + maximoPorGrupo));
    }
    return grupos;
};


const myPromise = (time=1, msg='foo') => new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(msg);
    }, time*1000);
});

const doCiclo = async() => new Promise( async(resolve, reject) => {
    let sum = 1
    for (let i = 0; i < 5; i++) {
        const  resp = await myPromise(.1)
        console.log('A', i+1, resp)
        const  resp2 = await myPromise(.1, 'zoo')
        console.log('B', i+1, resp2)
        sum += i
    }
    resolve(sum>=5)
});


// export const serchFunc = () => {
//     let bool = 1212
//     console.log('INI');
//     return doCiclo(). then(
//         res => res
//     )
//     // console.log('FIN');
// }

export const serchFunc = async() => {
    console.log('INI');
    let sum = 1
    for (let i = 0; i < 5; i++) {
        const  resp = await myPromise(.1)
        console.log('A', i+1, resp)
        const  resp2 = await myPromise(.1, 'zoo')
        console.log('B', i+1, resp2)
        sum += i
    }
    console.log(sum);
    return sum >=5
    // console.log('FIN');
}
