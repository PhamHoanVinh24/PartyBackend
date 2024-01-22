using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("HR_TRAINING_COURSE")]
    public class HRTrainingCourse
    {

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        [StringLength(maximumLength: 250)]
        public string Result { get; set; }
        public int? Employee_Id { get; set; }
        public DateTime? Start_Time { get; set; }
        public DateTime? End_Time { get; set; }
        [StringLength(maximumLength: 250)]
        public string Received_Place { get; set; }

        [StringLength(maximumLength: 250)]
        public string Traing_Place { get; set; }

        [StringLength(maximumLength: 250)]
        public string Certificate_Name { get; set; }

        [StringLength(maximumLength: 250)]
        public string Education_Name { get; set; }
        [StringLength(maximumLength: 250)]
        public string Info_Details { get; set; }
        [StringLength(maximumLength: 250)]
        public string Created_By { get; set; }

        [StringLength(maximumLength: 250)]
        public string Updated_By { get; set; }
        public DateTime? Created_Time { get; set; }
        public DateTime? Updated_Time { get; set; }

        public int? flag { get; set; }
    }
}