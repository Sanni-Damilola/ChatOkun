import { useQuery } from "@tanstack/react-query"
import { getOneUser, getUser } from '../api/AuthAPI'



export const useTanUser = () => {
    const { data: users, error, isLoading } = useQuery({
        queryKey: ['viewUser'],
        queryFn: getUser,
        refetchInterval: 1000,
    })
    return { users, error, isLoading }
}

export const useTanUserOne = (id: string) => {
    const { data: user, error, isLoading } = useQuery({
        queryKey: ['viewUserOne', { id: id }],
        queryFn: () => getOneUser(id),
        refetchInterval: 1000,
    })
    return { user, error, isLoading }
}


