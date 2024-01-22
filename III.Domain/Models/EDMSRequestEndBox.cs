using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("EDMS_REQUEST_END_BOX")]
    public class EDMSRequestEndBox
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string RqCode { get; set; }

        [StringLength(255)]
        public string BoxCode { get; set; }

    }
}