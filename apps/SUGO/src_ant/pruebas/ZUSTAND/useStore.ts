import { create } from 'zustand'

interface Store {
  count: number
  name: string
}

interface Actions {
  inc: () => void
  // dec: () => void
  setName: (name: string) => void
  reset: () => void
}

const initialState = {
  name: '',
  count: 1
}

// The recommended usage is to colocate actions and states within the store 
//    (let your actions be located together with your state).
// get vendria siendo this. ( Se debe ejecutar la funcion get )
const useStore = create<Store & Actions>()( (set, get): (Store & Actions) => ({
  ...initialState, 
  //! age: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
  // dec: () => set((state) => ({ count: state.count - 1 })),
  setName: (name) => set( (state) => ({ ...state, name }) ),
  reset: () => set( initialState )
}))

export default useStore


/** An alternative approach is to define actions at module level, external to the store.
 * This has a few advantages:
 *   It doesn't require a hook to call an action;
 *   It facilitates code splitting.
 * https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions
 */
export const dec = () => useStore.setState((state) => ({ count: state.count - 1 }))



export const useMeals = create(() => ({
  papaBear: 'large porridge-pot',
  mamaBear: 'middle-size porridge pot',
  littleBear: 'A little, small, wee pot',
}));

export const setMeal = () => useMeals.setState({
  papaBear: 'a large pizza',
});
