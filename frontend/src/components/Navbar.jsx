import { Link } from 'react-router-dom'; 

const Navbar = () => {
  return (
    <nav className="py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo on the left */}
        <div className="logo">
          <span className="font-montserrat font-bold text-2xl text-white">LOGO</span>
          {/* <img src="/public/logo.svg" alt="Logo" className="h-10" /> */}
        </div>
        
        {/* Navigation links in the middle */}
        <div className="bg-[#1E1E1E] rounded-[20px] px-4 py-3 flex items-center gap-6">
          {['Home', 'Buy', 'Rent', 'Sell', 'Agency'].map((item) => (
            <Link
              key={item}
              to={`/${item.toLowerCase()}`}
              className="relative px-3 text-white font-montserrat font-medium hover:text-[#F10000] transition-all duration-300 group"
            >
              {item}
              <span className="absolute -bottom-2 left-0 right-0 mx-auto w-0 h-px bg-[#f10000] group-hover:w-8 transition-all duration-300"></span>
            </Link>
          ))}
        </div>
        
        {/* Register and Login on the right */}
        <div className="flex space-x-6">
          <Link to="/register" className="text-blue-500 font-semibold font-montserrat">
            REGISTER
          </Link>
          <Link to="/login" className="text-white font-semibold font-montserrat">
            LOG IN
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;