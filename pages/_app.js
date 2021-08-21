import { useEffect, useState } from "react";
import "../styles/globals.css";

import { supabase } from "../utils/supabaseClient";
import { basePath } from "../utils/siteConfig";
import Cookie from "js-cookie";

function MyApp({ Component, pageProps }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  // User state management
  useEffect(async () => {
    // Update session
    setSession(await supabase.auth.session());
    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      handleAuthChange(event, session);
    });

    // Fetch profile data
    const session = await supabase.auth.session();
    if(session != null)
    {
      if(profile == null)
      {
        try
        {
          const { data, error } = await supabase
            .from("profiles")
            .select()
            .eq("id", session.user.id)
            .single();
          if(error)
            throw error;
          setProfile(data);
          Cookie.set("profile_data", JSON.stringify(data));
        }
        catch(error)
        {
          setProfile(null);
        }
      }
    }
  }, [])

  const handleAuthChange = async (event, session) => {
    await fetch(`${basePath}/api/auth`, {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json"
      }),
      body: JSON.stringify({event, session})
    })
  }

  return (
    <Component {...pageProps} sessionState={{session, setSession}} profileState={{profile, setProfile}} />
  )
}

export default MyApp
