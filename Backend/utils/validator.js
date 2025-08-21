import validator from 'validator';
 

export const validate = (data) => {
  if (!data.username) throw new Error("Please provide a username");
  if (!data.email || !validator.isEmail(data.email)) throw new Error("Please provide a valid email");
  if (!data.password) throw new Error("Please provide a password");
  if (!data.nativeLanguage) throw new Error("Please select your native language");
  if (!data.learningLanguage) throw new Error("Please provide your learning language");
  if (!data.knownLanguage) throw new Error("Please provide your known language");
};

