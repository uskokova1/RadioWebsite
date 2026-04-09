
import BoomBoxImage from "../BoomBoxTransparant.png";

const BlogButton = () => {



    return (
        <div>
            <img
                src={BoomBoxImage}
                alt="BoomBoxTransparant"
                draggable={false}
                className='absolute left-410 top-205 w-120 h-100 cursor-pointer select-none hover:scale-120 transition-all spring-duration-300 spring-bounce-60'
            />

        </div>
    );
};

export default BlogButton;