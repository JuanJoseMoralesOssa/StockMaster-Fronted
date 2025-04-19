import { create } from 'zustand'
// import axios from 'axios'

interface AuthStore {
    isAuthenticated: boolean
    checkAuth: () => void
    logout: () => void
}

const useAuthStore = create<AuthStore>((set) => ({
    isAuthenticated: false,

    checkAuth: () => {
        const token = localStorage.getItem('token')
        if (token) {
            set({ isAuthenticated: true })
            // useAuthStore.getState().checkPurchasedCourses(token)
        }
    },

    // checkPurchasedCourses: async (token) => {
    //     try {
    //         const response = await axios.get(
    //             'https://fewvlearns-kimy.onrender.com/purchased/purchased-courses',
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //             }
    //         )
    //         set({ hasPurchasedCourses: response.data.length > 0 })
    //     } catch (error) {
    //         console.error('Error checking purchased courses:', error)
    //     }
    // },

    login: () => {
        set({ isAuthenticated: true })
        const token = localStorage.getItem('token')
        if (token) {
            // useAuthStore.getState().checkPurchasedCourses(token)
        }
    },

    logout: () => {
        set({
            isAuthenticated: false,
            // hasPurchasedCourses: false,
        })
        localStorage.removeItem('token')
    },
}))

export default useAuthStore
