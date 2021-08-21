import { supabase } from "../utils/supabaseClient"
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Login()
{
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        try
        {
            setLoading(true);
            const { error } = await supabase.auth.signIn({
                email,
                password
            });
            if(error)
                throw error;
            router.push("/");
        }
        catch(error)
        {
            alert(error.message);
        }
        finally
        {
            setLoading(false);
        }
    }

    return (
        <>
            {!loading ?
                <>
                    <h2>Login</h2>
                    <form onSubmit={handleLogin}>
                        <input type="email" min="3" placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)}/>
                        <br/>
                        <input type="password" min="3" placeholder="Enter your password" onChange={(e) => setPassword(e.target.value)}/>
                        <br/>
                        <button type="submit">Login</button>
                    </form>
                    <h3>Interaction:</h3>
                    <Link passHref={true} href="/"><a>Home</a></Link>
                    <Link passHref={true} href="/signup"><a>Don't have an account?</a></Link>
                </>
            :
                <div>Please wait..</div>
            }
        </>
    )
}

// Block people with sessions
export async function getServerSideProps({ req })
{
    const { user } = await supabase.auth.api.getUserByCookie(req);
    
    if(user != null)
        return {
            redirect: {
                destination: "/",
                permanent: false
            }
        }
    
    return {
        props: {
            user: null
        }
    };
}