using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("VC_JNANA_FILE")]
    public class VCJnanaFile
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        [StringLength(maximumLength: 255)]
        public string file_code { get; set; }

        [StringLength(maximumLength: 255)]
        public string file_name { get; set; }

        [StringLength(maximumLength: 255)]
        public string file_title { get; set; }
        [StringLength(maximumLength: 255)]
        public string file_note { get; set; }

        public float? file_size { get; set; }

        [StringLength(maximumLength: 10)]
        public string file_ext { get; set; }

        public int? created_by { get; set; }
       
        public DateTime? created_time { get; set; }
        public DateTime? updated_time { get; set; }
        public int file_status { get; set; }

        [StringLength(maximumLength: 250)]
        public string file_cat_code { get; set; }

        [StringLength(maximumLength: 250)]
        public string file_path { get; set; }
    }
}
