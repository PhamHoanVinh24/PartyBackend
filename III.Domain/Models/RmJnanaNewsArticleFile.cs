using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("RM_JNANA_NEWS_ARTICLE_FILE")]
    public class RmJnanaNewsArticleFile
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string FileCode { get; set; }
        public string ArticleCode { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
       
    }
}
