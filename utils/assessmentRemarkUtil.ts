import { schoolProfileCollection } from "../models/schoolProfile";

export const remarkAndGrade = async (
  score: number,
  schoolId: string
): Promise<{ grade: string; remark: string }> => {
  if (score > 100 || score < 0) {
    return {
      grade: "--",
      remark: "--",
    };
  }

const schoolProfile = await schoolProfileCollection.findById(schoolId);

  if(schoolProfile?.gradingSystem == "grading-system-1") {
    return gradingSystem1(score);
  } else if(schoolProfile?.gradingSystem == "grading-system-2") {
    return gradingSystem2(score);
  } else {
    return {
      grade: "--",
      remark: "--",
    };
  }
  
  // if (score >= 90 && score <= 100) {
  //   return {
  //     grade: "A",
  //     remark: "Excellent",
  //   };
  // } else if (score >= 70 && score < 90) {
  //   return {
  //     grade: "B+",
  //     remark: "Very Good",
  //   };
  // } else if (score >= 60 && score < 70) {
  //   return {
  //     grade: "B",
  //     remark: "Good",
  //   };
  // } else if (score >= 50 && score < 60) {
  //   return {
  //     grade: "C",
  //     remark: "Average",
  //   };
  // } else if (score >= 40 && score < 50) {
  //   return {
  //     grade: "D",
  //     remark: "Below Average",
  //   };
  // } else if (score >= 30 && score < 40) {
  //   return {
  //     grade: "E",
  //     remark: "Weak",
  //   };
  // } else if (score >= 0 && score < 30) {
  //   return {
  //     grade: "F",
  //     remark: "Fail",
  //   };
  // } else {
  //     return {
  //         grade: "--",
  //         remark: "--"
  //       };
  // }

};

const gradingSystem1 = (score: number): { grade: string; remark: string } => {
  if (score >= 80 && score <= 100) {
    return {
      grade: "A",
      remark: "Excellent",
    };
  } else if (score >= 70 && score < 80) {
    return {
      grade: "B",
      remark: "Very Good",
    };
  } else if (score >= 60 && score < 70) {
    return {
      grade: "C",
      remark: "Good",
    };
  } else if (score >= 50 && score < 60) {
    return {
      grade: "D",
      remark: "Average",
    };
  } else if (score >= 40 && score < 50) {
    return {
      grade: "E",
      remark: "Fair",
    };
  } else if (score >= 0 && score < 40) {
    return {
      grade: "F",
      remark: "Fail",
    };
  } else {
    return {
      grade: "--",
      remark: "--",
    };
  }
}

const gradingSystem2 = (score: number): { grade: string; remark: string } => {
  if (score >= 80 && score <= 100) {
    return {
      grade: "A",
      remark: "Distinction",
    };
  } else if (score >= 60 && score < 80) {
    return {
      grade: "B",
      remark: "Merit",
    };
  } else if (score >= 50 && score < 60) {
    return {
      grade: "C",
      remark: "Pass",
    };
  } else if (score >= 0 && score < 50) {
    return {
      grade: "F",
      remark: "Fail",
    };
  } else {
    return {
      grade: "--",
      remark: "--",
    };
  }
}
