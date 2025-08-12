import ListingCard from "../components/ListingCard.jsx";
import UserIcon from "../assets/images/user.svg";

export default function UserView() {
  /**
   * ================================
   * BACKEND CONNECTION POINT
   * ================================
   * Replace this `mockUser` object with actual data from your backend API.
   * Example when connected:
   *   const { data: user } = useFetch(`/api/users/${userId}`);
   *   return user; // should contain name, bio, listings
   */
  const mockUser = {
    name: "Jane Doe",
    pfp: UserIcon,
    bio: "Class of '28. Environmental Studies Major + Art History Minor. I like vintage electronics and kitchenware.",
    listings: [
      {
        _id: "1",
        title: "Vintage Lamp",
        price: 11,
        condition: "used-good",
        category: "home-decor",
        description: "Warm color temperature. Not too bright.",
        images: [
          { url: "https://placehold.co/300x200?text=Vintage+Lamp" },
        ],
      },
      {
        _id: "2",
        title: "Ceramic Plant Pot",
        price: 15,
        condition: "new",
        category: "garden",
        description: "Handmade ceramic pot with a modern design.",
        images: [
          { url: "https://placehold.co/300x200?text=Ceramic+Pot" },
        ],
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Profile Icon and User Info */}
      <div className="flex items-center mb-4">
        <img
          src={mockUser.pfp}
          alt="User profile icon"
          className="w-12 h-12 rounded-full mr-4"
        />
        <h1 className="text-2xl font-bold">{mockUser.name}</h1>
      </div>

    <p className="text-gray-700 mb-6">{mockUser.bio}</p>

      {/* Listings */} 
      <h2 className="text-xl font-semibold mb-4">Listings</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {mockUser.listings.map((listing) => (
          <ListingCard key={listing._id} listing={listing} variant="default" />
        ))}
      </div>
    </div>
  );
}
