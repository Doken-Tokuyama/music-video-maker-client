const Header = () => {
    return (
        <div className="container flex items-center justify-between text-white py-6">
            <a
                href="/"
                className="hidden lg:flex items-center text-3xl select-none cursor-pointer"
            >
                Music Video Maker
            </a>
            <div className="flex text-center lg:text-left items-center text-xl gap-5">
                Copyright &copy; 2022 Vasilije Repović - All rights reserved!
            </div>
        </div>
    );
};

export default Header;
