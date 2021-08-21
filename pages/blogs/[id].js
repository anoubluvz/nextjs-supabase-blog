import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";
import Cookie from "js-cookie";

export default function Blogs({ profileState })
{
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { id: blogUID } = router.query;

    useEffect(async () => {
        try
        {
            setLoading(true);
            console.log(blogUID);
            const { data, error } = await supabase
                .from("blogs")
                .select()
                .eq("id", blogUID)
                .single();
            if(error)
                throw error;
            setBlog(data);
        }
        catch(error)
        {
            console.log(error.message);
        }
        finally
        {
            setLoading(false);
        }
    }, []);

    const deleteBlog = async () => {
        if(profileState.profile.role == "admin")
        {
            const { data, error } = await supabase
                .from("blogs")
                .delete()
                .match({ id: blogUID });
            if(error)
            {
                console.log(error.message);
                return;
            }
            const blogsToAdd = []
            for(let i = 0; i < profileState.profile.created_blogs.length; i++)
            {
                const currBlog = profileState.profile.created_blogs[i];
                if(currBlog != blogUID)
                    blogsToAdd.push(currBlog.id);
            }
            console.log(blogsToAdd);
            const { data: userData, error: err } = await supabase
                .from("profiles")
                .upsert({
                    ...profileState.profile,
                    created_blogs: blogsToAdd
                });
            if(err)
            {
                console.log(error.message);
                return;
            }
            router.push("/blogs");
            profileState.setProfile(userData);
            Cookie.set("profile_data", JSON.stringify(userData));
        }   
    }

    return (
        <>
            {!loading ?
                <>
                    {blog != null ?
                    <>
                        <h1>{blog.title}</h1>
                        <p>{blog.content}</p>
                        {profileState.profile.role == "admin" ?
                            <button onClick={deleteBlog}>Delete blog</button>
                        :
                            <></>
                        }
                    </>
                    :
                        <h1>Blog not found</h1>
                    }
                </>
            :
                <h3>Please wait...</h3>
            }
        </>
    )
}