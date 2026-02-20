import MyPredictionsCard from "@/components/predictions/MyPredictionsCard";
import SubmitPredictionCard from "@/components/predictions/SubmitPredictionCard";

export default function About() {
    return (
            <div className="grid gap-6 lg:grid-cols-2 mt-4">
                    <div className="min-w-0">
                      <SubmitPredictionCard />
                    </div>
            
                    <div className="min-w-0">
                        <MyPredictionsCard/>
                    </div>
                  </div>
    )
}