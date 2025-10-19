import { useState, useEffect } from 'react';

const ProductDisplay = () => {
  const products = [
    {
      id: 1,
      type: "wesing",
      image: "https://images-cdn.ubuy.co.in/6364cab11fa597133a005bec-wesing-boxing-protective-gear-for-men.jpg"
    },
    {
      id: 2,
      type: "venum",
      image: "https://scontent.fcgy2-4.fna.fbcdn.net/v/t39.30808-6/557210653_24818189111124179_6810102383383194283_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=0b6b33&_nc_eui2=AeHQ1G69O0A3sN92A0-w0Zcay7Hu6JaWKy_Lse7olpYrL4vGY64pqFJ04R1WkTjas9uVfE52qe6IEFfGWOwne9eQ&_nc_ohc=zpjenhlR638Q7kNvwHagHak&_nc_oc=AdnMKSZ50zI09bgLzcBVBrE1rn1d25tq-I5AtZ6enkA9qj3Hcby7kkzbHU4OXhIOXEw&_nc_zt=23&_nc_ht=scontent.fcgy2-4.fna&_nc_gid=6-5bMrDQCCY1psYiLNyfnA&oh=00_AffOveSgi2ceNAWTL0cb1EImCQePPkbYJD3j5qBc_sw59A&oe=68FA2B86"
    },
    {
      id: 3,
      type: "hayabusa",
      image: "https://themuaythaisupply.com/cdn/shop/files/image_2bffa6bc-5609-41ae-b64e-959136aad803_1080x.png?v=1690364673"
    },
    {
      id: 4,
      type: "Everlast",
      image: "https://cdn11.bigcommerce.com/s-97i9gwv/images/stencil/1280x1280/products/9528/126780/nujjxukscca__04110.1699441880.jpg"

    },
    {
      id: 5,
      type: "bag",
      image: "https://sportfirstgeraldton.com.au/cdn/shop/files/DWEQ141147_DWBLK_1_grande.jpg?v=1686200979"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        nextSlide();
      }, 5000); // 5000ms = 5 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAutoPlaying]);

  // Stop auto-play on user interaction
  const handleInteraction = (e) => {
    setIsAutoPlaying(false);
    handleClick(e);
    // Resume auto-play after 10 seconds of no interaction
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === products.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? products.length - 1 : prevIndex - 1
    );
  };

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    // If click is on left side, go to previous slide
    if (x < rect.width / 2) {
      prevSlide();
    } else {
      // If click is on right side, go to next slide
      nextSlide();
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-2 sm:p-4">
      <div className="relative flex flex-col items-center">
        <div 
          className="relative w-full cursor-pointer" 
          onClick={handleInteraction}
        >
          <img 
            src={products[currentIndex].image} 
            alt={products[currentIndex].type}
            className="w-full h-[400px] object-contain rounded-lg mb-2 transition-opacity duration-500"
            style={{
              backgroundColor: '#f3f4f6' // Light gray background for empty spaces
            }}
          />
        </div>
        
        <div className="flex gap-2 mt-4">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(index);
                setTimeout(() => setIsAutoPlaying(true), 10000);
              }}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDisplay;
