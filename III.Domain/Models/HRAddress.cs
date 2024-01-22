using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("HR_ADDRESS")]
    public class HRAddress
    {

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        [StringLength(maximumLength: 250)]
        public string Permanent_Address { get; set; }

        [StringLength(maximumLength: 250)]
        public string Now_Address { get; set; }

        [StringLength(maximumLength: 250)]
        public string Phone { get; set; }
        public DateTime? Start_Time { get; set; }
        public DateTime? End_Time { get; set; }
        public int? Employee_Id { get; set; }
        public DateTime? Created_Time { get; set; }
        public DateTime? Updated_Time { get; set; }

        public int? flag { get; set; }

        [StringLength(maximumLength: 250)]
        public string Created_By { get; set; }

        [StringLength(maximumLength: 250)]
        public string Updated_By { get; set; }

    }
}