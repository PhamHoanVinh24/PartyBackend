using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("HR_CONTACT")]
    public class HRContact
    {

        //[DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        [StringLength(maximumLength: 250)]
        public string Name { get; set; }

        [StringLength(maximumLength: 250)]
        public string Relationship { get; set; }

        [StringLength(maximumLength: 250)]
        public string Address { get; set; }

        [StringLength(maximumLength: 250)]
        public string Phone { get; set; }

        [StringLength(maximumLength: 250)]
        public string Job_Name { get; set; }

        [StringLength(maximumLength: 250)]
        public string Fax { get; set; }

        [StringLength(maximumLength: 250)]
        public string Email { get; set; }

        [StringLength(maximumLength: 250)]
        public string Note { get; set; }

        public int? Employee_Id { get; set; } 

        public DateTime? Created_Time { get; set; }
        public DateTime? Updated_Time { get; set; }

        [StringLength(maximumLength: 250)]
        public string Created_By { get; set; }

        [StringLength(maximumLength: 250)]
        public string Updated_By { get; set; }
        public DateTime? Birthday { get; set; }
        public int? flag { get; set; }
    }
}