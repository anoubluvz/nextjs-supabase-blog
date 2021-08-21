import { supabase } from "../utils/supabaseClient"
import { useState } from "react";
import Link from "next/link";

export default function Signup()
{
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [loading, setLoading] = useState(false);
    const [verify, setVerify] = useState(false);

    const handleSignup = async (e) => {
        try
        {
            setLoading(true);
            const { error } = await supabase.auth.signUp({
                email,
                password
            });
            if(error)
                throw error;
            setVerify(true);
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
                    {!verify ?
                        <>
                            <h2>Sign up</h2>
                            <form onSubmit={handleSignup}>
                                <input type="email" min="3" placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)}/>
                                <br/>
                                <input type="password" min="3" placeholder="Enter your password" onChange={(e) => setPassword(e.target.value)}/>
                                <br/>
                                <button type="submit">Sign up</button>
                            </form>
                            <h3>Interaction:</h3>
                            <Link passHref={true} href="/"><a>Home</a></Link>
                            <Link passHref={true} href="/login"><a>Already have an account?</a></Link>
                        </>
                    :
                        <h2>Check your email inbox, to verify!</h2>
                    }
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