import { supabase } from "../../supabaseClient";



async function signUpNewUser(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
    });
}
async function signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });
}
async function forgetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(
        email,
        {
            redirectTo: "http://localhost:4000/flowwp/reset-password",
        },
    );
}