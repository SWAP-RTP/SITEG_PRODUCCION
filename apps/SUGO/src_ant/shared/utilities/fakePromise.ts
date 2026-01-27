export const fakePromise = (options?: {resolve?, reject?, time?: number}) => {
    const {resolve='Ok', reject='No ok', time=1800} = options||{}
    return new Promise( (res, rej)=>{
        setTimeout(() => {
            Math.round(Math.random()*100)%2 ? res(resolve):rej(reject)
        }, time)
    })
}