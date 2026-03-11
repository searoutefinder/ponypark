// Router 
import { useRouter } from "next/router";

// Pages
import Home from "./_home";
import TreasureMapPage from "./_treasuremap";

export default function CatchAllPage() {
  const router = useRouter();
  
  const slug = router.query.slug;

  if (typeof slug === "undefined") {
    return <Home mode={"normal"} />;
  }

  return <TreasureMapPage mode={"treasure"}/>;
}