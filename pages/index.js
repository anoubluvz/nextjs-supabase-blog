import { supabase } from "../utils/supabaseClient";
import Link from "next/link";
import Cookie from "js-cookie";

export default function Home({ sessionState, profileState }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    Cookie.remove("profile_data");
  }

  return (
    <>
      <h1>Index</h1>
      {sessionState.session != null ?
        <>
          <h3>User info:</h3>
          <div>Logged in as {sessionState.session.user.email}</div>
          <div>UID: {sessionState.session.user.id}</div>
          <h3>Profile info:</h3>
          {profileState.profile != null ?
          <>
            <div>Profile username: {profileState.profile.username}</div>
            <div>Profile UID: {profileState.profile.id}</div>
            <div>Profile Role: {profileState.profile.role}</div>
          </>
          :
          <>
            <div>No profile found!</div>
            <Link passHref={true} href="/profile"><a>Setup profile</a></Link>
          </>
          }
          <h3>Interaction:</h3>
          <Link passHref={true} href="/profile"><a>Profile</a></Link>
          <Link passHref={true} href="/blogs"><a>Blogs</a></Link>
          <button onClick={handleLogout}>Log out</button>
        </>
      :
        <>
          <div>You are not logged in!</div>
          <Link passHref={true} href="/signup"><a>Sign up</a></Link>
          <Link passHref={true} href="/login"><a>Login</a></Link>
        </>        
      }
    </>
  )
}