'use client';

const Footer = () => {
  return (
    <footer className="w-full mt-auto bg-gray-900 text-gray-400 text-sm px-6 py-4 text-center">
      <p className="mb-2">
        Pokémon and Pokémon GO are copyright of{' '}
        <span className="text-white">The Pokémon Company</span>,{' '}
        <span className="text-white">Niantic, Inc.</span>, and{' '}
        <span className="text-white">Nintendo</span>. All trademarked images and names are property
        of their respective owners, and any such material is used on this site for educational
        purposes only.
      </p>
      <p>
        This site is inspired by PvPoke. <span className="text-white">PvPoke LLC</span> has no
        affiliation with The Pokémon Company or Niantic.
      </p>
    </footer>
  );
};

export default Footer;
