export interface Details {
  name:string;
  phone: string;
  email: string;
  address: string;
  logoUrl: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export interface Registerpageimage{
  imageurl: string;
}
export const Details: Details = {
  name: "Gennext IT",
  phone: "+91-78400 79095",
  email: "info@gennextit.com",
  address: "H-213, Electronic City, H Block, Sector 63, Noida, Uttar Pradesh 201309",
  logoUrl: "https://1wo6ua3kj0.ufs.sh/f/UdP0ZPpr4Tf5yIg4GSXv8fIKH9sGwdAFgcmbRQh6ZDVYkix3", // keep your logo in /public/images/
  socialLinks: {
    facebook: "https://facebook.com/gennextit",
    twitter: "https://twitter.com/gennextit",
    linkedin: "https://linkedin.com/company/gennextit",
    instagram: "https://instagram.com/gennextit"
  }
};


export const registerpageImage : Registerpageimage={
  imageurl:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqKu7jjsCkgOiQWk084XvTc9FiyCzJlPaFV3HThSWCOUQDnjrVtzo5_o1viuGVj6tlves&usqp=CAU"

} 



