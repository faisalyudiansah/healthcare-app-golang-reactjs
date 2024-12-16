import GoogleSvg from "@/assets/svg/googleSvg"

const GoogleAuth = () => {
  return (
    <>
      <a
        className="border w-full p-2 flex justify-center items-center gap-4"
        href={`${import.meta.env.VITE_BASE_URL}/auth/google/login`}

      >
        <GoogleSvg />
        Sign in with google
      </a>
    </>
  )
}

export default GoogleAuth