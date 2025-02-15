export const signIn = async (email: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append("grant_type", "x");
  formData.append("username", email);
  formData.append("password", password);
  formData.append("scope", "x");
  formData.append("client_id", "x");
  formData.append("client_secret", "x");

  const response = await fetch("https://3.111.52.81:8000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
};
