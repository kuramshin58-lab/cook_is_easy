import { Composition } from "remotion";
import { RecipeVideo } from "./compositions/RecipeVideo";
import { AdVideo, adVideoConfig } from "./ad/AdVideo";
import { KineticAdVideo, kineticAdVideoConfig } from "./ad/KineticAdVideo";

// Recipe video props interface
export interface RecipeVideoProps {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  difficulty: string;
}

// Default props for preview
const defaultRecipeProps: RecipeVideoProps = {
  title: "Garlic Butter Pasta",
  description: "Simple pasta tossed with garlic-infused butter and parmesan cheese.",
  ingredients: [
    "400g spaghetti",
    "60g butter",
    "4 cloves garlic, minced",
    "50g parmesan cheese",
    "Fresh parsley",
    "Salt and pepper"
  ],
  instructions: [
    "Bring a large pot of salted water to boil",
    "Cook spaghetti until al dente",
    "Melt butter and sauté garlic",
    "Toss pasta with garlic butter",
    "Add parmesan and parsley",
    "Season and serve"
  ],
  prepTime: 5,
  cookTime: 10,
  difficulty: "easy"
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main recipe video - vertical format for social media */}
      <Composition
        id="RecipeVideo"
        component={RecipeVideo}
        durationInFrames={450} // 15 seconds at 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultRecipeProps}
      />

      {/* Horizontal format for YouTube */}
      <Composition
        id="RecipeVideoHorizontal"
        component={RecipeVideo}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultRecipeProps}
      />

      {/* Square format for Instagram feed */}
      <Composition
        id="RecipeVideoSquare"
        component={RecipeVideo}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={defaultRecipeProps}
      />

      {/* Cook Is Easy Advertisement Video - 60 seconds at 60fps */}
      <Composition
        id={adVideoConfig.id}
        component={adVideoConfig.component}
        durationInFrames={adVideoConfig.durationInFrames}
        fps={adVideoConfig.fps}
        width={adVideoConfig.width}
        height={adVideoConfig.height}
      />

      {/* Cook Is Easy Kinetic Typography Ad - 45 seconds at 60fps */}
      <Composition
        id={kineticAdVideoConfig.id}
        component={kineticAdVideoConfig.component}
        durationInFrames={kineticAdVideoConfig.durationInFrames}
        fps={kineticAdVideoConfig.fps}
        width={kineticAdVideoConfig.width}
        height={kineticAdVideoConfig.height}
      />
    </>
  );
};
