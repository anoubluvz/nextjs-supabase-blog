import { supabase } from "../utils/supabaseClient";
import { useState } from "react";
import Link from "next/link";

export default function Profile({ user, profileState })
{
    const [username, setUsername] = useState(null);
    const [loading, setLoading] = useState(false);

    const createProfile = async (e) => {
        e.preventDefault();
        try
        {
            setLoading(true);
            const { data, error } = await supabase
                .from("profiles")
                .insert({
                    username,
                    role: "user",
                    id: user.id
                });
            if(error)
                throw error
            profileState.setProfile(data);
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
                {profileState.profile != null ?
                    <>
                        <h3>User email: {user.email}</h3>
                        <h3>Profile info:</h3>
                        <div>Profile name: {profileState.profile.username}</div>
                        <div>Profile UID: {profileState.profile.id}</div>
                        <div>Profile Role: {profileState.profile.role}</div>
                        <h3>Interaction:</h3>
                        <Link passHref={true} href="/"><a>Home</a></Link>
                        <Link passHref={true} href="/blogs"><a>Blogs</a></Link>
                        {profileState.profile.role == "admin" ?
                            <Link passHref={true} href="/admin"><a>Admin Page</a></Link>
                        :
                            <></>
                        }
                    </>
                :
                    <>
                        <form onSubmit={createProfile}>
                            <h1>Create a profile:</h1>
                            <input type="text" placeholder="Enter your username" min="3" onChange={(e) => setUsername(e.target.value)} />
                            <br/>
                            <button type="submit">Create profile</button>
                            <h3>Interaction:</h3>
                            <Link passHref={true} href="/"><a>Home</a></Link>
                        </form>
                    </>
                }
            </>
            :
                <div>Please wait...</div>
            }
        </>
    )
}

export async function getServerSideProps({ req })
{
    const { user } = await supabase.auth.api.getUserByCookie(req);

    if(user != null)
        return {
            props: {
                authenticated: true,
                user
            }
        }

    return {
        redirect: {
            destination: "/",
            permanent: false
        }
    }
}