import { useState } from "react";

export default function Home() {
 const [sidebarOpen, setSidebarOpen] = useState(false);
 const [dropdownOpen, setDropdownOpen] = useState(false);


 return (
   <div>
     <aside
         className={`bg-gray-50 border-r border-gray-200 w-64 min-h-screen px-3 py-4 transition-all
           ${sidebarOpen ? "block" : "hidden"} sm:block`}>
         <ul className="space-y-2 font-medium">
           {/* <li>
             <a href="#" className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100">
               <span className="ms-3">Dashboard</span>
             </a>
           </li> */}
           <li>
             <button
               type="button"
               onClick={() => setDropdownOpen(!dropdownOpen)}
               className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100"
             >
               <span className="flex-1 ms-3 text-left whitespace-nowrap">Categories</span>
               <span>{dropdownOpen ? "▲" : "▼"}</span>
             </button>
             {dropdownOpen && (
               <ul className="py-2 space-y-2">
                 <li>
                   <a href="#" className="flex items-center w-full p-2 text-gray-900 rounded-lg pl-11 hover:bg-gray-100">
                     Clothes
                   </a>
                 </li>
                 <li>
                   <a href="#" className="flex items-center w-full p-2 text-gray-900 rounded-lg pl-11 hover:bg-gray-100">
                     Kitchen Appliances
                   </a>
                 </li>
                 <li>
                   <a href="#" className="flex items-center w-full p-2 text-gray-900 rounded-lg pl-11 hover:bg-gray-100">
                     Cutlery
                   </a>
                 </li>
               </ul>
             )}
           </li>
       </ul>
     </aside>
   </div>
 );
}

