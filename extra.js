app.get("/user/:user/collections/:category", function(req,res){
  const categoryLink = req.params.category

  let categories = []
  for(item of userInfo.items){
    categories.push({
      title:item.category,
      link:item.categoryLink
    })
  }
  categories = [...new Map(categories.map(v => [JSON.stringify([v.title,v.link]), v])).values()]

  const currentItems = []
  for(item of userInfo.items){
    if(String(item.categoryLink) === String(categoryLink)){
      currentItems.push(item)
    }
  }
  console.log(currentItems)
  res.render("all-collections.ejs", {
    items:currentItems,
    categories:categories
  })
})




if($('#rightClicked-<%=itemNameFormatted%>').length > 0){
  $('#rightClicked-<%=itemNameFormatted%>').remove();
  $(this).toggleClass('green-background');
} else {
  $('#item-info-stay').append("<div id='rightClicked-<%=itemNameFormatted%>'><p><span style='font-size:1.2rem'><%=item.itemName%></span><br><span style='font-weight: normal;'><u><%=item.title1%></u><br><%=item.info1%></p></span></div>");
  $(this).toggleClass('green-background')
};





            <% const buttonObject = { %>
              <% 'itemName': item.itemName, %>
              <% 'checked': item.checked, %>
              <% 'title1': item.title1, %>
              <% 'info1': item.info1, %>
              <% 'title2': item.title2, %>
              <% 'info2': item.info2, %>
              <% 'title3': item.title3, %>
              <% 'info3': item.info3, %>
              <% 'title4': item.title4, %>
              <% 'info4': item.info4 %>
            <%}%>
