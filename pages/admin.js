import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import Link from "next/link";
import Cookie from "js-cookie";

export default function Admin({ profileState })
{
    const [title, setTitle] = useState(null);
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [blogs, setBlogs] = useState([]);

    useEffect(async () => {
        try
        {
            let newBlogs = [];
            await Promise.all(profileState.profile.created_blogs.map(async (blogUID) => {
                const { data, error } = await supabase
                    .from("blogs")
                    .select()
                    .eq("id", blogUID)
                    .single();
                if(error)
                {
                    console.log(error.message);
                    return;
                }
                newBlogs.push(data);
            }));
            setBlogs(newBlogs);
        }
        catch(error)
        {
            console.log(error.message);
        }
        console.log(blogs);
    }, [profileState.profile])

    const createBlog = async (e) => {
        e.preventDefault();
        try
        {
            setLoading(true);
            const blogData = await supabase
                .from("blogs")
                .insert({
                    title,
                    content
                });
            if(blogData.error)
                throw blogData.error;
            const profileData = await supabase
                .from("profiles")
                .upsert({
                    id: profileState.profile.id,
                    created_blogs: [
                        ...profileState.profile.created_blogs,
                        blogData.data[0].id
                    ]
                });
            if(profileData.error)
                throw profileData.error;
            // update application state
            profileState.setProfile(profileData.data[0]);
            Cookie.set("profile_data", JSON.stringify(profileData.data[0]));
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

    const deleteBlog = async (blogUID) => {
        if(profileState.profile.role == "admin")
        {
            setLoading(true);
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
            const blogsData = []
            for(let i = 0; i < blogs.length; i++)
            {
                const currBlog = blogs[i];
                if(currBlog.id != blogUID)
                {
                    blogsToAdd.push(currBlog.id);
                    blogsData.push(currBlog);
                }
            }
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
            profileState.setProfile(userData);
            Cookie.set("profile_data", JSON.stringify(userData));
            setLoading(false);
            setBlogs(blogsData);
        }   
    }

    return (
        <>
            {!loading ?
                <>
                    <h2>Create an blog</h2>
                    <form onSubmit={createBlog}>
                        <input type="text" placeholder="Enter blog title" min="3" onChange={(e) => setTitle(e.target.value)}/>
                        <br/>
                        <textarea type="text" placeholder="Enter blog content" min="5" onChange={(e) => setContent(e.target.value)}></textarea>
                        <br/>
                        <button type="submit">Publish</button>
                    </form>
                    <hr/>
                    <h3>Created blogs:</h3>
                    {
                        profileState.profile != null ?
                            <>
                                {profileState.profile.created_blogs != null ?
                                    <>
                                        {blogs != null ?
                                            <>
                                                {blogs.length == 0 ?
                                                    <div>User has no blogs created</div>
                                                :
                                                    <>
                                                        {blogs.map(blog => {
                                                            return (
                                                                <div key={blog.id}>
                                                                    <h2>{blog.title}</h2>
                                                                    <Link passHref={true} href={`/blogs/${blog.id}`}><a>View</a></Link>
                                                                    <button onClick={() => deleteBlog(blog.id)}>Delete</button>
                                                                </div>
                                                            )
                                                        })}
                                                    </>
                                                }
                                            </>
                                        :
                                            <div>No blogs fetched</div>
                                        }
                                    </>
                                :
                                    <div>User has no blogs created.</div>
                                }
                            </>
                        :
                            <div>Fetching profile data..</div>
                    }
                </>
            :
                <div>Please wait...</div>
            }
        </>
    )
}

export const getServerSideProps = ({ req }) => {
    const AUTHORIZED_ROLES = ["admin"];
    if(req.cookies.profile_data != null)
    {
        const data = JSON.parse(req.cookies.profile_data);
        for(let i = 0; i < AUTHORIZED_ROLES.length; i++)
        {
            const role = AUTHORIZED_ROLES[i];
            if(data.role == role)
            {
                return {
                    props: {
                        role,
                    }
                }
            }
        }
    }
    return {
        redirect: {
            destination: "/",
            permanent: false
        }
    }
}