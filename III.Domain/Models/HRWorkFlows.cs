using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("HR_WORKFLOWS")]
    public class HRWorkFlows
    {

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }
        [StringLength(maximumLength: 250)]
        public string Working_Process { get; set; }
        public int? Employee_Id { get; set; }
        [StringLength(maximumLength: 250)]
        public string Description { get; set; }
        [StringLength(maximumLength: 250)]
        public string Name_Job { get; set; }
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