import { jwtDecode } from 'jwt-decode'
import {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'

export type AuthenticationState =
    | {
          isAuthenticated: true
          token: string
          userId: string
      }
    | {
          isAuthenticated: false
      }

export type Authentication = {
    state: AuthenticationState
    authenticate: (token: string) => void
    signout: () => void
}

export const AuthenticationContext = createContext<Authentication | undefined>(
    undefined
)

export const AuthenticationProvider: React.FC<PropsWithChildren> = ({
    children,
}) => {
    const [state, setState] = useState<AuthenticationState>(() => {
        const storedToken = localStorage.getItem('authToken')
        if (storedToken) {
            try {
                const userId = jwtDecode<{ id: string }>(storedToken).id
                return {
                    isAuthenticated: true,
                    token: storedToken,
                    userId,
                }
            } catch (error) {
                console.error('Invalid token in localStorage', error)
                localStorage.removeItem('authToken')
            }
        }
        return { isAuthenticated: false }
    })

    const authenticate = useCallback(
        (token: string) => {
            localStorage.setItem('authToken', token)
            setState({
                isAuthenticated: true,
                token,
                userId: jwtDecode<{ id: string }>(token).id,
            })
        },
        [setState]
    )

    const signout = useCallback(() => {
        localStorage.removeItem('authToken')
        setState({ isAuthenticated: false })
    }, [setState])

    const contextValue = useMemo(
        () => ({ state, authenticate, signout }),
        [state, authenticate, signout]
    )

    return (
        <AuthenticationContext.Provider value={contextValue}>
            {children}
        </AuthenticationContext.Provider>
    )
}

export function useAuthentication() {
    const context = useContext(AuthenticationContext)
    if (!context) {
        throw new Error(
            'useAuthentication must be used within an AuthenticationProvider'
        )
    }

    const { state, signout } = context

    useEffect(() => {
        if (state.isAuthenticated) {
            try {
                const decodedToken = jwtDecode<{ exp: number }>(state.token)
                if (decodedToken.exp * 1000 < Date.now()) {
                    console.log('Token has AEAZE')
                    // Token has expired
                    signout()
                }
            } catch (error) {
                console.error('Error decoding token', error)
                signout()
            }
        }
    }, [state, signout])

    return context
}

export function useAuthToken() {
    const { state } = useAuthentication()
    if (!state.isAuthenticated) {
        throw new Error('User is not authenticated')
    }
    return state.token
}
