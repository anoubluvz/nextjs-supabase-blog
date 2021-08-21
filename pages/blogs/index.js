import { useEffect, useState } from "react"
import { supabase } from "../../utils/supabaseClient";
import Link from "next/link";

export default function Blogs()
{
    const [blogs, setBlogs] = useState([]);

    useEffect(async () => {
        const { data, error } = await supabase
            .from("blogs")
            .select();
        if(error)
        {
            console.log(error.message);
            return;
        }
        setBlogs(data);
    }, []);

    return (
        <>
            {blogs.length == 0 ?
                <h1>No blogs were published yet</h1>
            :
                <>
                    <h1>Blogs: </h1>
                    {blogs.map(blog => {
                        return (
                            <div key={blog.id}>
                                <h2>{blog.title}</h2>
                                <Link passHref={true} href={`/blogs/${blog.id}`}><a>View</a></Link>
                            </div>
                        )  
                    })}
                </>
            }
        </>
    )
}